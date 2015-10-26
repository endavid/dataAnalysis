function W=euclideanComb(w,h,k,s);
% W=euclideanComb(w,h);
%
% k: k-neighbours
% s: sigma of the gaussian
%
% w=euclideanComb(30,40,4,0.005);
% figure, imshow(full(w));
%
% See: euclideanMatrix, LPP


if nargin<3
    k=0;
    s=1;
elseif nargin<4
    s=1;
end

W=sparse(0,0);

%figure
for j=1:h
    for i=1:w
        W=[W;sparse(reshape((euclideanMatrix(w,h,i,j,k,s))',1,w*h))];
    end
end
