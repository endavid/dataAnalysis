function K=Keuclidean(X,Y);
% K=Keuclidean(X);
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% Y: If another vector is provided, then compute the distance between them
% 
% Just computes the Euclidean distance between all pairs of vectors.
%
% See: KGaussian
%

% David Gavilan. 05/07/08

if nargin<2
    [n d]=size(X);
    % |Xi-Xj|^2 = |Xi|^2 - 2<Xi,Xj> + |Xj|^2
    K=sum(X.^2,2);
    K=repmat(K,1,n)+repmat(K',n,1)-2*X*X';
else
    [n1 d]=size(X);
    [n2 d]=size(Y);
    % |Xi-Yj|^2 = |Xi|^2 - 2<Xi,Yj> + |Yj|^2
    XX=sum(X.^2,2);
    YY=sum(Y.^2,2);
    K=repmat(XX,1,n2)+repmat(YY',n1,1)-2*X*Y';    
end
