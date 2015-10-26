function D=Kangular(X,Y);
% D=Kangular(X,Y);
%
% Angular distance
%
% Y: optional (see Keuclidean)
%
% A=load('c:/projects/ipcv/blobby/shapes.dat','-ASCII');
% X=A(:,14);
% D=Kangular(X);
% figure, imshow(imresize(D,[280 280],'nearest'));
%
% X=A(:,1:13);
% DD=Keuclidean(X);
% figure, imshow(imresize(DD,[280 280],'nearest'));
%    (position, volume, color) -> *3
% figure, imshow(imresize((3*DD+D)/4,[280 280],'nearest'));
% E=A(:,15);
% figure, imshow(imresize(E*E',[280 280],'nearest'));
% figure, imshow(imresize((3*DD+D.^(E*E'))/4,[280 280],'nearest'));
%
% See: Keuclidean, sketchComparison

if nargin<2
    C=cos(X);
    S=sin(X);
    D=C*C'+S*S'; % cos(alfa)
    D=1-abs(D); % distance
else
    C1=cos(X);
    S1=sin(X);
    C2=cos(Y);
    S2=sin(Y);
    D=C1*C2'+S1*S2';
    D=1-abs(D);
end

