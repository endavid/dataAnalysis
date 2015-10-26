function [psi,Xs]=PPursuit(X,m,measure);
% [psi,Xs]=PPursuit(X,m,measure);
%
% Projection Pursuit
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% m: #Dimensions in which we want to project the data
% measure: the name of the non-Gaussianity function
%
% Xs:   The centered and sphered data
% psi:  The vectors that span our projection
%

[n, d]=size(X);

% center the data
mu = mean(X);
Xc = X - ones(n, 1) * mu;

% covariance matrix
C = Xc'*Xc;

% sphere the data
C2 = pinv(C)^(1/2);
  % the imaginary part is almost zero: real(C2)
  C2=real(C2);
Xs=Xc * C2;
%Xs=Xc; % don't sphere if I don't mix units (all dimensions have same scale)

% Ex:
% figure, imshow(maxcon(hsv2rgb(reshape(Xc(:,1:3),160,120,3))))
%   The data is centered in the HSV space, so some data is lost
%
% figure, imshow(maxcon(hsv2rgb(reshape(Xs(:,1:3),160,120,3))))
%   I get a gray scale image with low contrast. By sphering, 
%   the HSV2RGB conversion is possible.


% Generalized Non-Gaussian Method

psi=zeros(d,1); % in the end, it will be d x m
%figure, plot(Xs(:,1),Xs(:,2),'r.');
%hold on;
for k=1:m
 oldng=1e30;
 ng=1e20; % value of ng-measure at b
 b=rand(1,d); % start with random direction
 db=1e20; % distance between b_{k+1} and b_k
 e=1e-7; % stop if it doesn't move much
 %b=[0 1];
 nits = 0;
 while (db>e & oldng>ng)
    old = b;
    % non-gaussian
    bX = Xs * b'; % n x 1
    g = eval(sprintf('%sD(bX)',measure));
    dg= eval(sprintf('%sDD(bX)',measure));
            %g = g * ones(1,d); % n x d
            %b = b * sum(dg)/n - sum(Xs.*g)/n;
    b = b * sum(dg)/n - g'*Xs/n;
    

    % projection onto the span({\psi})
    bP = b * psi; % 1 x k
    b = b - bP*psi';
            %b = b - sum((bP'*ones(1,d)).*psi');
    
    
    % normalization to hypersphere of r=1
    b = b/(sum(b.^2).^0.5);
    
    % has b moved?
    db = sum((old - b).^2);
    % value
    oldng = ng;
    bX = Xs * b'; % n x 1
    ng = eval(sprintf('%s(bX)',measure));
    ng = sum(ng)/n; % minimize this
    
    [db ng]
    %line([-b(1);b(1)],[-b(2);b(2)],'Color','b')
    %waitforbuttonpress;
    nits = nits +1;
 end
    nits
  %  line([-b(1);b(1)],[-b(2);b(2)],'Color','g')
 psi(:,k)=b';
end
%hold off;
%psi